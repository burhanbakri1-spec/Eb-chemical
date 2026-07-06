import React from "react";

function QuantityControl({ language = "en", quantity, onDecrease, onIncrease }) {
  function localized(en, ar, he) {
    if (language === "ar") return ar;
    if (language === "he") return he;
    return en;
  }
  return (
    <div className="quantity-control" aria-label={localized("Quantity control", "التحكم في الكمية", "בקרת כמות")}>
      <button onClick={onDecrease} type="button">
        -
      </button>
      <span>{quantity}</span>
      <button onClick={onIncrease} type="button">
        +
      </button>
    </div>
  );
}

export default QuantityControl;
