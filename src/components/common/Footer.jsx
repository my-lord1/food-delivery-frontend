import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#FFFBF2] border-t-4 border-orange-600 h-43 p-10 gap-5 flex flex-row place-content-evenly">
      <div className="flex flex-col items-start gap-1 w-100 justify-center">
        <h2 className="text-4xl sm:text-5xl font-black text-orange-600 tracking-tighter">
          giggidy
        </h2>
        <p className=" font-medium text-sm sm:text-base">
          We bring the family table to wherever you are. High-quality food, lightning speed.
        </p>
        <div className="flex gap-2 sm:gap-3 ">
          {[Facebook, Twitter, Instagram].map((Icon, i) => (
          <a key={i} href="#" className="p-2.5 sm:p-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 shadow-sm hover:shadow-md">
            <Icon size={18} className="w-5 h-5" />
          </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-center gap-3">
        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em]">Support</h3>
        <div className="space-y-4 sm:space-y-5">
        <a href="#"className="flex items-start sm:items-center gap-3 sm:gap-4 group">
        <div className="p-2.5 sm:p-3 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
          <Mail size={18} className="sm:w-5 sm:h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Email</p>
          <p className="text-gray-900 font-bold text-sm">hello@giggidy.com</p>
        </div>
        </a>

        <a href="tel:+15556844439" className="flex items-start sm:items-center gap-3 sm:gap-4 group">
          <div className="p-2.5 sm:p-3 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
          <Phone size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Phone</p>
            <p className="text-gray-900 font-bold text-sm">+00000 GIGGIDY</p>
          </div>
        </a>
        </div>
        </div>
        </div>

    </footer>
  );
};

export default Footer;