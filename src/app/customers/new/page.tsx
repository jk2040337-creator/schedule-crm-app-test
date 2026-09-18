import CustomerForm from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">고객 등록</h1>
      <CustomerForm />
    </div>
  );
}
