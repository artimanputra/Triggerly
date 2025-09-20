"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Appbar } from "../../../components/Appbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { Zap } from "../../../types/zap";
import { ZapCell } from "../../../components/ZapCell";
import Modal from "../../../components/Modal";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState<
    { id: string; name: string; image: string }[]
  >([]);
  const [availableTriggers, setAvailableTriggers] = useState<
    { id: string; name: string; image: string }[]
  >([]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function ZapDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();

  const [zap, setZap] = useState<Zap | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  }>();

  const [selectedTriggerMetadata, setSelectedTriggerMetadata] = useState<
    Record<string, unknown>
  >({});

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

  useEffect(() => {
    if (!id) return;
    axios
      .get<{ zap: Zap }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap/${id}`, {
        headers: { Authorization: localStorage.getItem("token") || "" },
      })
      .then((res) => {
        const zapData = res.data.zap;
        setZap(zapData);

        if (zapData.trigger) {
          setSelectedTrigger({
            id: zapData.trigger.triggerId,
            name: zapData.trigger.type?.name || "",
          });
          setSelectedTriggerMetadata(zapData.trigger.metadata || {});
        }

        setSelectedActions(
          zapData.actions.map((a, idx) => ({
            index: idx + 2,
            availableActionId: a.actionId,
            availableActionName: a.type?.name || "",
            metadata: a.metadata || {},
          }))
        );

        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!zap) return <div>No zap found</div>;

  const saveChanges = async () => {
    if (!selectedTrigger?.id) return;
    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap/${id}`,
      {
        name: zap.name,
        availableTriggerId: selectedTrigger.id,
        triggerMetadata: selectedTriggerMetadata,
        actions: selectedActions.map((a) => ({
          availableActionId: a.availableActionId,
          actionMetadata: a.metadata,
        })),
      },
      {
        headers: { Authorization: localStorage.getItem("token") || "" },
      }
    );
    router.push(`/dashboard?updatedZapId=${id}&updatedZapName=${encodeURIComponent(zap.name)}`);
  };

  return (
    <ProtectedRoute>
      <Appbar />

      {/* Top Section: Editable Zap Name + Save Button */}
      <div className="flex items-center justify-center p-4 bg-gray-800 shadow-md space-x-4">
        <input
          type="text"
          value={zap.name}
          onChange={(e) => setZap({ ...zap, name: e.target.value })}
          placeholder="Enter Zap name"
          className="px-3 py-2 rounded-md text-gray-200 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-auto"
          style={{ minWidth: "150px" }} 
        />

        <button
          onClick={saveChanges}
          className="btn-primary transition rounded-xl px-4 py-2 text-white font-semibold"
        >
          Save
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

        {/* Add Action */}
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
          onSelect={(props) => {
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
