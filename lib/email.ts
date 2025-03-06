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
    subject: "Order Confirmation - Pokémon Singles Shop",
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
          <li>${item.name} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}</li>
        `
          )
          .join("")}
      </ul>
      <p>We'll send you another email when your order has been shipped.</p>
      <p>Thank you for shopping with Pokémon Singles Shop!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
}
