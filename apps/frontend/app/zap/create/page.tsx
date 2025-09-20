"use client";
import { Appbar } from "../../../components/Appbar";
import { Input } from "../../../components/Input";
import CronSelector from "../../../components/CronSelector";
import { PrimaryButton } from "../../../components/buttons/PrimaryButton";
import { ZapCell } from "../../../components/ZapCell";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ProtectedRoute from "../../../components/ProtectedRoute";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/available`).then((x) =>
      setAvailableTriggers(x.data.availableTriggers)
    );

    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/action/available`).then((x) =>
      setAvailableActions(x.data.availableActions)
    );
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function ZapCreate() {
  const router = useRouter();
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();
  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  }>();

  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      availableActionId: string;
      availableActionName: string;
      metadata: Record<string, unknown>;
    }[]
  >([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );

  const [selectedTriggerMetadata, setSelectedTriggerMetadata] = useState<
    Record<string, unknown>
  >({});

  return (
    <ProtectedRoute>
      <Appbar />

      {/* Top Publish Button */}
      <div className="flex justify-end p-4 bg-gray-800 shadow-md">
        <button
          onClick={async () => {
            if (!selectedTrigger?.id) return;

            await axios.post(
             `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`,
              {
                availableTriggerId: selectedTrigger.id,
                triggerMetadata: selectedTriggerMetadata,
                actions: selectedActions.map((a) => ({
                  availableActionId: a.availableActionId,
                  actionMetadata: a.metadata,
                })),
              },
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );

            router.push("/dashboard");
          }}
          className="btn-primary transition rounded-xl px-4 py-2 text-white font-semibold"
        >
          Publish
        </button>
      </div>

      {/* Main Section */}
      <div className="flex flex-col items-center py-10 space-y-6">
        {/* Trigger */}
        <ZapCell
          onClick={() => setSelectedModalIndex(1)}
          name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"}
          index={1}
          />

        {/* Actions */}
        <div className="space-y-4">
          {selectedActions.map((action) => (
            <ZapCell
              key={action.index}
              onClick={() => setSelectedModalIndex(action.index)}
              name={
                action.availableActionName
                  ? action.availableActionName
                  : "Action"
              }
              index={action.index}
              />
          ))}
        </div>

        {/* Add Action Button */}
        <button
          onClick={() =>
            setSelectedActions((a) => [
              ...a,
              {
                index: a.length + 2,
                availableActionId: "",
                availableActionName: "",
                metadata: {},
              },
            ])
          }
          className="btn-primary rounded-full w-12 h-12 text-white text-2xl shadow-lg"
        >
          +
        </button>
      </div>

      {/* Modal */}
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          onSelect={(
            props: null | { name: string; id: string; metadata: Record<string, unknown> }
          ) => {
            if (props === null) {
              setSelectedModalIndex(null);
              return;
            }
            if (selectedModalIndex === 1) {
              setSelectedTrigger({
                id: props.id,
                name: props.name,
              });
              setSelectedTriggerMetadata(props.metadata);
            } else {
              setSelectedActions((a) => {
                const newActions = [...a];
                newActions[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                  metadata: props.metadata,
                };
                return newActions;
              });
            }
            setSelectedModalIndex(null);
          }}
          index={selectedModalIndex}
        />
      )}
    </ProtectedRoute>
  );
}

function Modal({
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

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
      <div className="bg-gray-800 text-gray-200 rounded-2xl shadow-lg p-6 w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-lg font-semibold">
            Select {index === 1 ? "Trigger" : "Action"}
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
          {step === 1 && selectedAction?.id === "email" && (
            <EmailSelector setMetadata={(metadata) => onSelect({ ...selectedAction, metadata })} />
          )}

          {step === 1 && selectedAction?.id === "send-sol" && (
            <SolanaSelector setMetadata={(metadata) => onSelect({ ...selectedAction, metadata })} />
          )}

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
                  <Image alt="" src={image} width={30} height={30} className="rounded-full" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}

          {step === 1 && selectedAction?.id === "cron" && (
            <CronSelector setMetadata={(metadata) => onSelect({ ...selectedAction, metadata })} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmailSelector({setMetadata}: {
    setMetadata: (params: Record<string, unknown>) => void;
}) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setEmail(e.target.value)}></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
        <div className="pt-2">
            <PrimaryButton onClick={() => {
                setMetadata({
                    email,
                    body
                })
            }}
            >Submit</PrimaryButton>
        </div>
    </div>
}

function SolanaSelector({setMetadata}: {
    setMetadata: (params: Record<string, unknown>) => void;
}) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");    

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setAddress(e.target.value)}></Input>
        <Input label={"Amount"} type={"text"} placeholder="To" onChange={(e) => setAmount(e.target.value)}></Input>
        <div className="pt-4">
        <PrimaryButton onClick={() => {
            setMetadata({
                amount,
                address
            })
        }}>Submit</PrimaryButton>
        </div>
    </div>
}

