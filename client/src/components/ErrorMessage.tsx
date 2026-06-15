export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
    {message}
  </div>
);
