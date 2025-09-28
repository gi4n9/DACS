import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6">
      <Link to="/" className="flex items-center hover:underline">
        <Home size={16} className="mr-1" />
        Trang chủ
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={14} className="mx-2" />
          {item.href ? (
            <Link to={item.href} className="hover:underline text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumb;
