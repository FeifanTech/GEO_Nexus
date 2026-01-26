"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Target,
  Stethoscope,
  Radar,
  Factory,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";

const ONBOARDING_STEPS = [
  {
    title: "欢迎使用 GEO Nexus",
    description: "GEO Nexus 是您的 AI 搜索优化智能平台，帮助您提升品牌在 AI 搜索引擎中的表现。",
    icon: Globe,
    color: "from-slate-700 to-slate-900",
  },
  {
    title: "第一步：添加产品",
    description: "在「产品管理」中添加您的产品信息，包括名称、卖点和目标用户。",
    icon: Package,
    color: "from-blue-500 to-indigo-500",
    action: "/product-manager",
  },
  {
    title: "第二步：添加竞品",
    description: "在「竞品管理」中添加竞争对手信息，了解市场竞争态势。",
    icon: Target,
    color: "from-purple-500 to-pink-500",
    action: "/competitors",
  },
  {
    title: "第三步：GEO 诊断",
    description: "使用「GEO 诊断」功能，AI 将分析您的产品在搜索引擎中的表现。",
    icon: Stethoscope,
    color: "from-emerald-500 to-teal-500",
    action: "/geo-diagnosis",
  },
  {
    title: "第四步：监测排名",
    description: "在「AI 监测」中创建监测任务，持续追踪品牌在各大 AI 搜索引擎的排名。",
    icon: Radar,
    color: "from-orange-500 to-amber-500",
    action: "/ai-monitor",
  },
  {
    title: "第五步：生成内容",
    description: "使用「内容工厂」批量生成 PDP 摘要、评论脚本和种草文案。",
    icon: Factory,
    color: "from-rose-500 to-pink-500",
    action: "/content-factory",
  },
];

const STORAGE_KEY = "geo-nexus-onboarding-completed";

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay showing the dialog for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-normal">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400"
              onClick={handleSkip}
            >
              跳过引导
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`
              flex items-center justify-center w-20 h-20 rounded-full 
              bg-gradient-to-br ${step.color}
            `}>
              <Icon className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <DialogTitle className="text-xl mb-3">
              {step.title}
            </DialogTitle>
            <p className="text-slate-500">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-slate-900"
                    : index < currentStep
                    ? "bg-slate-400"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            上一步
          </Button>
          <Button
            onClick={handleNext}
            className={`gap-2 bg-gradient-to-r ${step.color}`}
          >
            {isLastStep ? (
              <>
                <Sparkles className="h-4 w-4" />
                开始使用
              </>
            ) : (
              <>
                下一步
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reset onboarding (for testing)
export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
