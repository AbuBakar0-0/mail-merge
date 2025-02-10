import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Email Merge",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
