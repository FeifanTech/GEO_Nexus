import { Bot, Brain, Moon, MessageSquare, FileText, Sparkles, Search, LucideIcon } from "lucide-react";
import { AIModel } from "@/types/monitor";

export const AI_MODEL_ICONS: Record<AIModel, LucideIcon> = {
  gpt4: Bot,
  claude: Brain,
  kimi: Moon,
  qwen: MessageSquare,
  wenxin: FileText,
  doubao: Sparkles,
  perplexity: Search,
};

interface AIModelIconProps {
  model: AIModel;
  className?: string;
}

export function AIModelIcon({ model, className = "h-5 w-5" }: AIModelIconProps) {
  const Icon = AI_MODEL_ICONS[model];
  return <Icon className={className} />;
}
