import { ReactNode } from "react";

export const DarkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col justify-center px-8 py-2 cursor-pointer btn-primary  text-white rounded text-center"
    >
      {children}
    </div>
  );
};
