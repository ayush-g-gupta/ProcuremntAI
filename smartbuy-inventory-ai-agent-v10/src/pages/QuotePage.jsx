import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/UI";
import { Icon } from "../components/Icon";
export function QuotePage() {
  const n = useNavigate();
  return (
    <div className="quote-layout">
      <main>
        <div className="breadcrumb">
          AI recommendation <Icon name="chevron" size={12} /> Digital quote
        </div>
        <Card className="quote-paper">
          <header>
            <div className="brand">
              <span>S</span>
              <div>
                <b>B2B SmartBuy</b>
                <small>Digital Purchase Quote</small>
              </div>
            </div>
            <div>
              Quote number<strong>SB-2026-08452</strong>
            </div>
          </header>
          <div className="parties">
            <div>
              <small>BUYER</small>
              <b>Sophie Anderson</b>
              <span>Procurement Manager</span>
            </div>
            <div>
              <small>SUPPLIER</small>
              <b>EV Components Manufacturing</b>
              <span>Contract active · Score 94/100</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>BTMC-450</b>
                  <small>Battery Thermal Management Module</small>
                </td>
                <td>2,500</td>
                <td>$18.40</td>
                <td>$46,000</td>
              </tr>
              <tr>
                <td>Freight & handling</td>
                <td colSpan="2" />
                <td>$1,200</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th colSpan="2" />
                <th>$47,200</th>
              </tr>
            </tfoot>
          </table>
          <div className="delivery">
            <Icon name="check" size={18} />
            <div>
              <b>Delivery confirmed</b>
              <small>Estimated: 24 Aug 2026</small>
            </div>
          </div>
          <footer>
            <Button onClick={() => n("/approvals")}>
              Submit for approval <Icon name="arrow" size={15} />
            </Button>
          </footer>
        </Card>
      </main>
      <aside className="quote-side">
        <Card>
          <h3>Quote summary</h3>
          <p>
            Subtotal <b>$46,000</b>
          </p>
          <p>
            Shipping <b>$1,200</b>
          </p>
          <p>
            Total <strong>$47,200</strong>
          </p>
        </Card>
        <Card className="personal">
          Personalized quote
          <p>
            Generated using contract pricing and requirements from SmartBuy AI.
          </p>
        </Card>
      </aside>
    </div>
  );
}
