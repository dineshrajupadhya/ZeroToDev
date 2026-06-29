const nodemailer = require('nodemailer');

const getTransporter = async () => {
  if (process.env.BREVO_API_KEY) {
    return null;
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('📧 Using Ethereal test email:', testAccount.user);
  return transport;
};

const sendEmailViaBrevo = async ({ to, subject, html }) => {
  const senderEmail = process.env.SMTP_USER || 'noreply@contactlesscafe.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'Contactless Cafe';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return { success: true, messageId: data.messageId };
};

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.BREVO_API_KEY) {
    return await sendEmailViaBrevo({ to, subject, html });
  }

  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || '"Contactless Cafe" <orders@contactlesscafe.com>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📧 Email preview URL:', previewUrl);
  }

  return { success: true, messageId: info.messageId, previewUrl };
};

const sendOrderConfirmation = async (user, order) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackUrl = `${frontendUrl}/track/${order.order_number}`;

    const itemRows = order.items.map(item => `
      <tr>
        <td style="padding:10px 15px;border-bottom:1px solid #eee;color:#555;">${item.name}</td>
        <td style="padding:10px 15px;border-bottom:1px solid #eee;color:#555;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 15px;border-bottom:1px solid #eee;color:#555;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">Order Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Thank you for your order</p>
        </div>

        <div style="padding:30px;">
          <div style="background:#f8f9fa;border-radius:10px;padding:20px;margin-bottom:25px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;color:#888;">Order Number</td>
                <td style="padding:6px 0;color:#333;font-weight:bold;text-align:right;">${order.order_number}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#888;">Order Type</td>
                <td style="padding:6px 0;color:#333;font-weight:bold;text-align:right;">${order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}</td>
              </tr>
              ${order.table_number ? `
              <tr>
                <td style="padding:6px 0;color:#888;">Table</td>
                <td style="padding:6px 0;color:#333;font-weight:bold;text-align:right;">${order.table_number}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:6px 0;color:#888;">Status</td>
                <td style="padding:6px 0;color:#333;font-weight:bold;text-align:right;">${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</td>
              </tr>
            </table>
          </div>

          <h3 style="color:#333;margin-bottom:10px;">Order Items</h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f8f9fa;">
                <th style="padding:10px 15px;text-align:left;color:#888;font-weight:600;">Item</th>
                <th style="padding:10px 15px;text-align:center;color:#888;font-weight:600;">Qty</th>
                <th style="padding:10px 15px;text-align:right;color:#888;font-weight:600;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:10px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:4px 0;color:#888;">Subtotal</td>
                <td style="padding:4px 0;color:#555;text-align:right;">₹${order.subtotal?.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#888;">Tax (5%)</td>
                <td style="padding:4px 0;color:#555;text-align:right;">₹${order.tax?.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#333;font-weight:bold;font-size:18px;">Total</td>
                <td style="padding:8px 0;color:#f97316;font-weight:bold;font-size:18px;text-align:right;">₹${order.total_amount?.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="text-align:center;margin-top:30px;">
            <a href="${trackUrl}" style="display:inline-block;background:#f97316;color:#fff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              Track Your Order
            </a>
            <p style="color:#aaa;font-size:12px;margin-top:10px;">You will receive updates as your order status changes</p>
          </div>
        </div>

        <div style="background:#f8f9fa;padding:20px;text-align:center;color:#aaa;font-size:12px;">
          <p style="margin:0;">Contactless Cafe — Contactless Ordering System</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: `Order Confirmation — ${order.order_number}`,
      html,
    });

    console.log('📧 Order confirmation email sent:', result.messageId || result.id);
    return { success: true, ...result };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendOrderStatusUpdate = async (user, order, oldStatus) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackUrl = `${frontendUrl}/track/${order.order_number}`;

    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      preparing: 'Your order is now being prepared by our kitchen.',
      ready: 'Your order is ready! Please collect it.',
      served: 'Your order has been served. Enjoy your meal!',
      cancelled: 'Your order has been cancelled.',
    };

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:30px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">Order Status Update</h1>
        </div>

        <div style="padding:30px;text-align:center;">
          <p style="color:#555;font-size:16px;margin-bottom:15px;">
            Order <strong>${order.order_number}</strong>
          </p>
          <div style="display:inline-block;background:${order.status === 'cancelled' ? '#fee2e2' : '#dcfce7'};color:${order.status === 'cancelled' ? '#dc2626' : '#16a34a'};padding:12px 24px;border-radius:8px;font-size:18px;font-weight:bold;margin-bottom:15px;">
            ${order.status?.toUpperCase()}
          </div>
          <p style="color:#777;font-size:14px;">${statusMessages[order.status] || 'Your order status has been updated.'}</p>

          <div style="margin-top:30px;">
            <a href="${trackUrl}" style="display:inline-block;background:#f97316;color:#fff;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Track Order
            </a>
          </div>
        </div>

        <div style="background:#f8f9fa;padding:20px;text-align:center;color:#aaa;font-size:12px;">
          <p style="margin:0;">Contactless Cafe — Contactless Ordering System</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: `Order ${order.order_number} — ${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}`,
      html,
    });

    console.log('📧 Status update email sent:', result.messageId || result.id);
    return { success: true, ...result };
  } catch (error) {
    console.error('Status email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };
