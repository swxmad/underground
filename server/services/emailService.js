import nodemailer from "nodemailer";

const PLACEHOLDER_CREDENTIALS = new Set([
  "yourmail@gmail.com",
  "your_app_password",
  ""
]);

export const isMailConfigured = () => {
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASS?.trim();

  if (!user || !pass) return false;
  if (PLACEHOLDER_CREDENTIALS.has(user) || PLACEHOLDER_CREDENTIALS.has(pass)) {
    return false;
  }

  return true;
};

const useConsoleMode = () => {
  const mode = process.env.MAIL_MODE?.trim().toLowerCase();

  if (mode === "console") return true;
  if (mode === "smtp") return false;

  return !isMailConfigured();
};

const createTransport = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }

  return nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
};

export const sendMail = async (to, subject, text) => {
  if (useConsoleMode()) {
    console.log("\n========== EMAIL (режим разработки) ==========");
    console.log(`Кому: ${to}`);
    console.log(`Тема: ${subject}`);
    console.log(text);
    console.log("==============================================\n");
    return { mode: "console" };
  }

  try {
    const transport = createTransport();

    await transport.sendMail({
      from: `"Underground" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text
    });

    return { mode: "smtp" };
  } catch (err) {
    console.error("Ошибка отправки письма:", err);

    if (err.code === "EAUTH") {
      const authError = new Error(
        "Ошибка авторизации почты. Для Gmail укажите реальный email и пароль приложения (App Password), не обычный пароль аккаунта."
      );
      authError.code = "EAUTH";
      throw authError;
    }

    throw err;
  }
};
