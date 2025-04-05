import React from "react";

function ReturnPolicy() {
  return (
    <div className="text-center flex flex-col gap-4">
      <p className="m-auto text-2xl font-bold">RETURN POLICY</p>
      <p className="font-semibold text-2xl">
        Due to the nature of sealed product in the TCG industry, we do not offer
        returns. That said, if something arrives damaged or not as described,
        send us an email and we'll make it right
      </p>

      <p className="font-semibold text-2xl">
        Cancellations can be requested prior to shipment but are subject to a 6%
        cancellation fee. This fee will be deducted from the refunded amount.
        This covers the non-refundable payment processing fee we are charged
        when the initial transaction is made.
      </p>

      <p className="font-semibold text-2xl">
        Email support@djcollects.com with the Subject line: "CANCEL ORDER #..."
      </p>
    </div>
  );
}

export default ReturnPolicy;
