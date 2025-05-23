import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { InvoiceData } from "@/lib/types";

const InvoicePayments: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="border bg-gray-100  border-gray-200 rounded-md overflow-hidden">
      <div
        className=" p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}>
        <h2 className="text-base lg:text-lg font-semibold flex items-center">
          Payments Received
          <span className="text-xs md:text-sm ml-2 bg-[rgb(188,242,252)]  px-2 py-1 rounded-full">
            {invoice?.payments?.length || 0}
          </span>
        </h2>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div className="bg-gray-100 overflow-x-auto">
          <table className="w-full   min-w-max">
            <thead className="text-xs md:text-base ">
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 text-left font-semibold text-gray-600">
                  Date
                </th>
                <th className="py-2 px-4 text-left font-semibold text-gray-600">
                  Payment #
                </th>

                <th className="py-2 px-4 text-left font-semibold text-gray-600">
                  Payment Mode
                </th>
                <th className="py-2 px-4 text-left font-semibold text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-base">
              {invoice?.payments?.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-4">
                    {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-4  ">{payment.id}</td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2   mr-2"></span>
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2 px-4">${payment.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoicePayments;