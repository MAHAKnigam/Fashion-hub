// Fashion Hub checkout: Supabase order creation + Razorpay Checkout (test mode).
(function () {
  function checkoutMessage(message, type = "info") {
    if (typeof window.showToast === "function") window.showToast(message, type);
    else alert(message);
  }

  function loadRazorpayCheckout() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-razorpay-checkout]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpayCheckout = "true";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load Razorpay Checkout. Check your internet connection and try again."));
      document.head.appendChild(script);
    });
  }

  window.showCheckoutForm = function () {
    const cart = typeof getCart === "function" ? getCart() : [];
    if (!cart.length) {
      checkoutMessage("Your cart is empty.", "error");
      return;
    }
    if (cart.some(item => !item.dbId)) {
      checkoutMessage("Product details are still syncing. Refresh the page and try again.", "error");
      return;
    }
    const form = document.getElementById("checkoutAddressForm");
    if (form) {
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.startRazorpayCheckout = async function (event) {
    if (event) event.preventDefault();
    const button = document.getElementById("placeOrderButton");
    const form = document.getElementById("shippingAddressForm");
    const client = window.fashionSupabase;

    if (!client || !form) {
      checkoutMessage("Checkout is not configured. Please try again later.", "error");
      return;
    }

    const cart = getCart();
    if (!cart.length || cart.some(item => !item.dbId)) {
      checkoutMessage("Your cart is empty or product details are not ready. Please refresh and try again.", "error");
      return;
    }

    const formData = new FormData(form);
    const shippingAddress = {
      recipient_name: String(formData.get("recipient_name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      address_line1: String(formData.get("address_line1") || "").trim(),
      address_line2: String(formData.get("address_line2") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      postal_code: String(formData.get("postal_code") || "").trim(),
      country: "India"
    };

    if (!shippingAddress.recipient_name || !shippingAddress.address_line1 ||
        !shippingAddress.city || !shippingAddress.state ||
        !/^[6-9]\d{9}$/.test(shippingAddress.phone) ||
        !/^\d{6}$/.test(shippingAddress.postal_code)) {
      checkoutMessage("Enter all required address details, a valid 10-digit Indian mobile number, and a 6-digit PIN code.", "error");
      return;
    }

    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Preparing secure payment…";
      }

      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      const session = sessionData?.session;
      if (sessionError || !session) throw new Error("Your login session has expired. Please log in again.");

      await loadRazorpayCheckout();

      const { data: orderData, error: orderError } = await client.functions.invoke("create-razorpay-order", {
        body: {
          items: cart.map(item => ({ productId: item.dbId, quantity: item.quantity })),
          shippingAddress
        }
      });
      if (orderError) throw new Error(orderError.message || "Could not create your order.");
      if (!orderData || !orderData.razorpayOrderId || !orderData.keyId) {
        throw new Error(orderData?.error || "The server returned an incomplete payment order.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Fashion Hub",
        description: "Fashion Hub order",
        order_id: orderData.razorpayOrderId,
        prefill: { name: shippingAddress.recipient_name, email: session.user.email || "", contact: shippingAddress.phone },
        notes: { fashion_hub_order_id: orderData.orderId },
        theme: { color: "#ff4d6d" },
        modal: {
          ondismiss: function () {
            if (button) {
              button.disabled = false;
              button.textContent = "Pay securely with Razorpay";
            }
          }
        },
        handler: async function (paymentResponse) {
          try {
            if (button) button.textContent = "Verifying payment…";
            const { data: verification, error: verificationError } = await client.functions.invoke("verify-razorpay-payment", {
              body: {
                orderId: orderData.orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature
              }
            });
            if (verificationError) throw new Error(verificationError.message || "Payment verification failed.");
            if (!verification?.verified) throw new Error(verification?.error || "We could not verify this payment.");

            if (verification.paymentStatus === "captured") {
              saveCart([]);
              updateCartCount();
              renderCartItems();
              const summary = document.getElementById("cartSummary");
              if (summary) summary.style.display = "none";
              const checkoutForm = document.getElementById("checkoutAddressForm");
              if (checkoutForm) checkoutForm.hidden = true;
              if (verification.inventoryConfirmed === false) {
                checkoutMessage("Payment received, but stock needs a manual check before fulfilment. Please contact support with order ID: " + orderData.orderId, "error");
              } else {
                checkoutMessage("Payment successful! Your Fashion Hub order is confirmed. Order ID: " + orderData.orderId, "success");
              }
            } else {
              checkoutMessage("Payment is authorized and awaiting final confirmation. Please keep your order ID: " + orderData.orderId, "info");
            }
          } catch (verificationFailure) {
            console.error("Fashion Hub payment verification:", verificationFailure);
            checkoutMessage(verificationFailure.message || "Payment was received but could not yet be verified. Please contact support with your order ID: " + orderData.orderId, "error");
          } finally {
            if (button) {
              button.disabled = false;
              button.textContent = "Pay securely with Razorpay";
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        const description = response.error?.description || "Payment could not be completed.";
        checkoutMessage(description + " You can try again.", "error");
        if (button) {
          button.disabled = false;
          button.textContent = "Pay securely with Razorpay";
        }
      });
      razorpay.open();
    } catch (error) {
      console.error("Fashion Hub checkout:", error);
      checkoutMessage(error.message || "Checkout could not be started. Please try again.", "error");
      if (button) {
        button.disabled = false;
        button.textContent = "Pay securely with Razorpay";
      }
    }
  };
})();
