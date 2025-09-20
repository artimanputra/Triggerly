import EmailSelector from "./EmailSelector";
import SolanaSelector from "./SolanaSelector";
import CronSelector from "../CronSelector";

// mapping between action/trigger IDs and their UI components
export const selectorMap: Record<
  string,
  React.FC<{ setMetadata: (metadata: Record<string, unknown>) => void }>
> = {
  email: EmailSelector,
  "send-sol": SolanaSelector,
  cron: CronSelector,
};
