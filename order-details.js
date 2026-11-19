// A customer can view only their own order. Supabase RLS is the access-control boundary.
(function () {
  const container = document.getElementById('orderDetailsContainer');

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function formatINR(paise) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2
    }).format(Number(paise || 0) / 100);
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' :
      date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function showMessage(message) {
    container.className = 'details-message';
    container.textContent = message;
  }

  function renderAddress(address) {
    if (!address || typeof address !== 'object') return '<p>Delivery address unavailable.</p>';
    const fields = [
      address.recipient_name, address.phone, address.address_line1,
      address.address_line2, address.city, address.state, address.postal_code,
      address.country || 'India'
    ].filter(Boolean);
    return fields.map(value => '<p>' + escapeHTML(value) + '</p>').join('');
  }

  function renderTracking(order, payment) {
    const status = String(order.status || 'pending_payment').toLowerCase();
    const steps = [
      { key: 'placed', label: 'Order Placed', note: 'We have received your order.' },
      { key: 'confirmed', label: 'Payment Confirmed', note: 'Your payment has been confirmed.' },
      { key: 'processing', label: 'Processing', note: 'Your order is being prepared.' },
      { key: 'shipped', label: 'Shipped', note: 'Your order is on its way.' },
      { key: 'delivered', label: 'Delivered', note: 'Your order has been delivered.' }
    ];
    const statusIndex = {
      pending_payment: 0, paid: 1, processing: 2, shipped: 3, delivered: 4,
      cancelled: 0, payment_failed: 0, refunded: 1
    };
    const completedThrough = statusIndex[status] ?? 0;
    const paymentCaptured = payment && payment.status === 'captured';
    const exceptional = ['cancelled', 'payment_failed', 'refunded'].includes(status);
    const stepsMarkup = steps.map((step, index) => {
      let complete = index <= completedThrough;
      if (index === 1 && !paymentCaptured && status !== 'refunded') complete = false;
      if (exceptional && index > (status === 'refunded' ? 1 : 0)) complete = false;
      const current = !exceptional && index === completedThrough;
      return `
        <div class="tracking-step ${complete ? 'is-complete' : ''} ${current ? 'is-current' : ''}">
          <span class="tracking-dot" aria-hidden="true">${complete ? '✓' : ''}</span>
          <div class="tracking-copy">
            <strong>${step.label}</strong>
            <span>${step.note}</span>
          </div>
        </div>`;
    }).join('');
    let alert = '';
    if (status === 'pending_payment') alert = '<p class="tracking-alert">Your order is waiting for payment confirmation. The timeline will update when payment is confirmed.</p>';
    if (status === 'payment_failed') alert = '<p class="tracking-alert">Payment was not completed. Please contact support if money was deducted from your account.</p>';
    if (status === 'cancelled') alert = '<p class="tracking-alert">This order has been cancelled.</p>';
    if (status === 'refunded') alert = '<p class="tracking-alert">This order has been refunded.</p>';
    return `
      <section class="details-card tracking-card">
        <h2>Order tracking</h2>
        <p class="tracking-caption">Current status: <strong>${escapeHTML(status.replaceAll('_', ' '))}</strong></p>
        <div class="tracking-list">${stepsMarkup}</div>
        ${alert}
        <p class="tracking-footnote">Tracking reflects the latest order status recorded by Fashion Hub. Delivery dates will appear when shipment updates are added.</p>
      </section>`;
  }

  function renderOrder(order) {
    const items = Array.isArray(order.order_items) ? order.order_items : [];
    const paymentValue = order.payments;
    const payment = Array.isArray(paymentValue) ? paymentValue[0] : paymentValue;
    const status = String(order.status || 'unknown').toLowerCase();

    const itemMarkup = items.length ? items.map(item => `
      <div class="detail-item">
        <div>
          <div class="detail-item-name">${escapeHTML(item.product_name)}</div>
          <div class="detail-muted">Quantity: ${Number(item.quantity)} · Unit price: ${formatINR(item.unit_price_paise)}</div>
        </div>
        <div class="detail-price">${formatINR(item.line_total_paise)}</div>
      </div>`).join('') : '<p>There are no item records for this order.</p>';

    const paymentStatus = payment ? String(payment.status || 'unknown').replaceAll('_', ' ') : 'Not available';
    const paymentMethod = payment ? String(payment.provider || 'Razorpay') : 'Not available';

    container.className = '';
    container.innerHTML = `
      ${renderTracking(order, payment)}
      <section class="details-card">
        <div class="details-top">
          <div>
            <div class="details-order-id">Order #${escapeHTML(order.id)}</div>
            <div class="details-date">Placed on ${escapeHTML(formatDate(order.created_at))}</div>
          </div>
          <span class="details-status ${escapeHTML(status)}">${escapeHTML(status.replaceAll('_', ' '))}</span>
        </div>
        <h2>Items in this order</h2>
        ${itemMarkup}
        <div class="details-total"><span>Order total</span><span>${formatINR(order.total_paise)}</span></div>
      </section>
      <div class="details-grid">
        <section class="details-card">
          <h2>Delivery address</h2>
          ${renderAddress(order.shipping_address)}
        </section>
        <section class="details-card">
          <h2>Payment information</h2>
          <p><strong>Payment provider:</strong> ${escapeHTML(paymentMethod)}</p>
          <p><strong>Payment status:</strong> ${escapeHTML(paymentStatus)}</p>
          <p><strong>Amount:</strong> ${formatINR(payment ? payment.amount_paise : order.total_paise)}</p>
          <p><strong>Currency:</strong> ${escapeHTML(order.currency || 'INR')}</p>
        </section>
      </div>`;
  }

  async function loadOrderDetails() {
    if (!window.fashionSupabase) {
      showMessage('Unable to connect to the store right now. Please refresh the page.');
      return;
    }

    const { data: { user }, error: userError } = await window.fashionSupabase.auth.getUser();
    if (userError || !user) {
      showMessage('Please log in to view your order details.');
      const link = document.createElement('a');
      link.href = 'login.html';
      link.textContent = 'Go to Login';
      link.className = 'details-back';
      container.appendChild(link);
      return;
    }

    const orderId = new URLSearchParams(window.location.search).get('id');
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!orderId || !uuidPattern.test(orderId)) {
      showMessage('This order link is invalid. Please return to My Orders and choose an order.');
      return;
    }

    const { data: order, error } = await window.fashionSupabase
      .from('orders')
      .select('id, user_id, status, total_paise, currency, shipping_address, created_at, order_items(id, product_name, unit_price_paise, quantity, line_total_paise), payments(provider, status, amount_paise, currency)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Order details query failed:', error);
      showMessage('We could not load this order. Please refresh and try again.');
      return;
    }
    if (!order) {
      showMessage('This order could not be found in your account.');
      return;
    }

    renderOrder(order);
  }

  document.addEventListener('DOMContentLoaded', loadOrderDetails);
})();