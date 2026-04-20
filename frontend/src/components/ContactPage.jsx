import React from "react";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/contact/send-mail", form);
      alert("Thanks for contacting us!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  const styles = `
    .custom-scroll::-webkit-scrollbar { width: 6px; }
    .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
  `;

  return (
    <div className="min-h-screen flex flex-col app-bg">
      <style>{styles}</style>
      <div className="flex-1 flex flex-col items-center justify-center mt-4 pb-6 w-full px-4 md:px-0">

        <div className="w-full md:w-[90%] lg:w-[80%] mb-8 text-center md:text-left px-2">
          <h2 className="text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">Get In Touch</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div className="card-bg border border-gray-200 dark:border-gray-700 w-full md:w-[90%] lg:w-[80%] rounded-2xl shadow-lg p-8 md:p-12 flex flex-col lg:flex-row justify-between gap-10">

          {/* LEFT SIDE */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center">
            <div className="text-2xl md:text-3xl font-semibold italic text-gray-900 dark:text-white bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 p-8 rounded-2xl border-l-4 mb-8 relative overflow-hidden shadow-sm flex-shrink-0">
              <span className="block leading-relaxed z-10 relative">“Struggling to find your nutritional matcha? We can help you blend.”</span>
              <cite className="text-sm text-emerald-700 dark:text-emerald-400 mt-6 block text-right font-bold not-italic z-10 relative">~ Contact Us</cite>
            </div>

            <div className="w-full justify-center flex mt-2">
              <div className="flex items-center justify-center space-x-6 lg:space-x-8 text-2xl lg:text-3xl text-slate-400">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-emerald-50 transition hover:text-emerald-500"
                >
                  <FaInstagram />
                </a>

                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-emerald-50 transition hover:text-emerald-500"
                >
                  <FaTwitter />
                </a>

                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-emerald-50 transition hover:text-emerald-500"
                >
                  <FaFacebook />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM (KEPT NEW STYLING) */}
          <div className="w-full lg:w-[45%]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full py-3.5 px-5 rounded-xl text-base shadow-sm font-medium bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full py-3.5 px-5 rounded-xl text-base shadow-sm font-medium bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Your Feedback"
                  className="w-full py-3.5 px-5 rounded-xl text-base shadow-sm font-medium bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all resize-none custom-scroll focus:bg-white"
                  required
                ></textarea>
              </div>

              <button className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md shadow-emerald-200 dark:shadow-none transition-transform active:scale-95 cursor-pointer text-base">
                Send My Recipe for Success!
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* FOOTER MAP */}
      <footer className="w-full flex justify-center py-8 bg-transparent">
        <div className="w-[80%] flex justify-center">
          <div className="relative w-full h-48 rounded-lg overflow-hidden card-bg border border-gray-200 dark:border-gray-700 shadow-md">
            <iframe
              title="Admin location"
              width="100%"
              height="100%"
              src="https://www.google.com/maps?q=31.2551178,75.7060709&z=15&output=embed"
              className="pointer-events-none border-0"
              aria-hidden="true"
            />
            <a
              href="https://www.google.com/maps/search/?api=1&query=31.2551178,75.7060709"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="Open admin location in Google Maps"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
