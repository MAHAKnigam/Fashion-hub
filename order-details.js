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