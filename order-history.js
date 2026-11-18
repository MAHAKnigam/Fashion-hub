// Customer order history. Supabase RLS ensures users can only read their own orders.
(function () {
  const container = document.getElementById('ordersContainer');

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function formatINRFromPaise(paise) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2
    }).format(Number(paise || 0) / 100);
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' :
      date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function renderOrders(orders) {
    if (!orders.length) {
      container.className = 'orders-message';
      container.innerHTML = '<h2>No orders yet</h2><p>Your completed purchases will appear here.</p><a class="continue-shopping" href="collection.html">Start Shopping</a>';
      return;
    }

    container.className = '';
    container.innerHTML = orders.map(order => {
      const items = Array.isArray(order.order_items) ? order.order_items : [];
      const lines = items.length ? items.map(item => `
        <div class="order-line">
          <div>
            <div class="order-product">${escapeHTML(item.product_name)}</div>
            <div class="order-product-meta">Quantity: ${Number(item.quantity)} · Unit price: ${formatINRFromPaise(item.unit_price_paise)}</div>
          </div>
          <div class="order-line-total">${formatINRFromPaise(item.line_total_paise)}</div>
        </div>`).join('') : '<p class="order-product-meta">No item details available.</p>';

      const status = String(order.status || 'unknown').toLowerCase();
      return `
        <article class="order-card">
          <div class="order-heading">
            <div>
              <div class="order-number">Order #${escapeHTML(order.id)}</div>
              <div class="order-date">${escapeHTML(formatDate(order.created_at))}</div>
            </div>
            <span class="order-status ${escapeHTML(status)}">${escapeHTML(status.replaceAll('_', ' '))}</span>
          </div>
          <div>${lines}</div>
          <div class="order-footer">
            <span class="order-total-label">Order total</span>
            <span class="order-total">${formatINRFromPaise(order.total_paise)}</span>
          </div>
          <div style="text-align:right;margin-top:16px;">
            <a class="continue-shopping" href="order-details.html?id=${encodeURIComponent(order.id)}">View order details</a>
          </div>
        </article>`;
    }).join('');
  }

  async function loadOrderHistory() {
    if (!window.fashionSupabase) {
      container.textContent = 'Unable to connect to the store right now. Please refresh the page.';
      return;
    }

    const { data: { user }, error: userError } = await window.fashionSupabase.auth.getUser();
    if (userError || !user) {
      container.innerHTML = '<h2>Please log in</h2><p>Log in to view your order history.</p><a class="continue-shopping" href="login.html">Go to Login</a>';
      return;
    }

    const { data, error } = await window.fashionSupabase
      .from('orders')
      .select('id, status, total_paise, currency, created_at, order_items(id, product_name, unit_price_paise, quantity, line_total_paise)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Order history query failed:', error);
      container.className = 'orders-message';
      container.textContent = 'We could not load your orders. Please refresh and try again.';
      return;
    }

    renderOrders(data || []);
  }

  document.addEventListener('DOMContentLoaded', loadOrderHistory);
})();