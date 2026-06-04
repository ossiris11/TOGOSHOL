import './PcMockup.css';

type PcMockupProps = {
  size?: 'hero' | 'mini';
};

export function PcMockup({ size = 'hero' }: PcMockupProps) {
  return (
    <div className={`pcMockup pcMockup-${size}`} aria-hidden="true">
      <div className="pcGlow" />
      <div className="pcCase">
        <div className="pcGlass">
          <span className="pcLine pcLineTop" />
          <span className="pcLine pcLineMid" />
          <span className="pcLine pcLineBottom" />
          <div className="pcFan pcFanOne rgbPulse" />
          <div className="pcFan pcFanTwo rgbPulse" />
          <div className="pcFan pcFanThree rgbPulse" />
          <div className="pcGpu" />
        </div>
      </div>
      <div className="pcReflection" />
    </div>
  );
}
