import Lottie from "lottie-react";
import speakerLoading from "../public/speaker-loading.json";

export interface LottieProps {
  style: React.CSSProperties;
  loop: boolean;
}

export default function LottieLoader({ loop, style }: LottieProps) {
  return <Lottie style={style} animationData={speakerLoading} loop={loop} />;
}
