import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/UI";
import { Icon } from "../components/Icon";
const demo = [
  {
    sku: "BTMC-450",
    name: "Battery Thermal Management Module",
    category: "Battery Thermal",
    price: 18.4,
    availability: 3200,
    leadTimeDays: 8,
    sustainability: "A",
    supplierRating: 94,
    recommended: true,
  },
  {
    sku: "BTMC-520",
    name: "Battery Thermal Management Module Pro",
    category: "Battery Thermal",
    price: 21.6,
    availability: 1100,
    leadTimeDays: 14,
    sustainability: "B+",
    supplierRating: 88,
  },
  {
    sku: "BTMC-410",
    name: "Battery Thermal Management Module Lite",
    category: "Battery Thermal",
    price: 15.8,
    availability: 700,
    leadTimeDays: 7,
    sustainability: "B",
    supplierRating: 82,
  },
];
export function ProductsPage() {
  const [products, setProducts] = useState(demo);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((r) => setProducts(r.data))
      .catch(() => {});
  }, []);
  return (
    <div className="catalog">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">PRODUCT LIBRARY</p>
          <h1>Product Catalog</h1>
          <p>Your approved product library · {products.length} products</p>
        </div>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <Card
            className={`product-card ${p.recommended ? "recommended" : ""}`}
            key={p.sku}
          >
            {p.recommended && (
              <span className="ai-label">✦ AI recommended</span>
            )}
            <span className="catalog-icon">
              <Icon name="cube" size={18} />
            </span>
            <h3>{p.sku}</h3>
            <p>{p.name}</p>
            <div className="product-details">
              <span>
                Availability<b>{p.availability.toLocaleString()} units</b>
              </span>
              <span>
                Lead time<b>{p.leadTimeDays} days</b>
              </span>
              <span>
                Sustainability<b>{p.sustainability}</b>
              </span>
              <span>
                Supplier rating<b>{p.supplierRating}/100</b>
              </span>
            </div>
            <footer>
              <div>
                <strong>${p.price.toFixed(2)}</strong>
                <small>/ unit · contract</small>
              </div>
              {p.recommended ? (
                <Link className="button" to="/recommendation">
                  Configure
                </Link>
              ) : (
                <button className="button">View</button>
              )}
            </footer>
          </Card>
        ))}
      </div>
    </div>
  );
}
