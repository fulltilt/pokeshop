import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: any
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Order Confirmation - DJCollects",
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order has been successfully placed and is being processed.</p>
      <h2>Order Details:</h2>
      <p>Order ID: ${orderDetails.id}</p>
      <p>Total Amount: $${orderDetails.total.toFixed(2)}</p>
      <h3>Items:</h3>
      <ul>
        ${orderDetails.items
          .map(
            (item: any) => `
          <li>${item.name} - Quantity: ${
              item.quantity
            } - Price: $${item.price.toFixed(2)}</li>
        `
          )
          .join("")}
      </ul>
      <p>We'll send you another email when your order has been shipped.</p>
      <p>Thank you for shopping with DJCollects!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "DJCollects Password Reset Email",
    html: `<p>Hello,</p>
    
    <p>You recently requested to reset your password for your Pokémon Singles Shop account.</p>
    <p>Click the link below to reset it:</p>
    
    <p>${resetLink}</p>
    
    <p>This link will expire in 1 hour.</p>
    
    <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
    
    <p>Thank you,</p>
    <p>DJCollects</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}
