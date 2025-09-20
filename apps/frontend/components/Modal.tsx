"use client";
import { useState } from "react";
import Image from "next/image";
import { selectorMap } from "./selectors/selectorMap";

export default function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (
    props: null | { name: string; id: string; metadata: Record<string, unknown> }
  ) => void;
  availableItems: { id: string; name: string; image: string }[];
}) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    name: string;
  }>();
  const isTrigger = index === 1;

  const SelectorComponent =
    selectedAction?.id && selectorMap[selectedAction.id]
      ? selectorMap[selectedAction.id]
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
      <div className="bg-gray-800 text-gray-200 rounded-2xl shadow-lg p-6 w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-lg font-semibold">
            Select {isTrigger ? "Trigger" : "Action"}
          </h2>
          <button
            onClick={() => onSelect(null)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              {availableItems.map(({ id, name, image }) => (
                <div
                  key={id}
                  onClick={() => {
                    if (isTrigger && id === "cron") {
                      setStep(1);
                      setSelectedAction({ id, name });
                    } else if (isTrigger) {
                      onSelect({ id, name, metadata: {} });
                    } else {
                      setStep(1);
                      setSelectedAction({ id, name });
                    }
                  }}
                  className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                >
                  <Image
                    alt=""
                    src={image}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}

          {step === 1 && SelectorComponent && (
            <SelectorComponent
              setMetadata={(metadata) =>
                onSelect({ ...selectedAction!, metadata })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
