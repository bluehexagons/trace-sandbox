import type { SandboxRunMode } from '../sandboxUrl';
import type { SandboxExecutionSettings } from '../types';

export type { SandboxExecutionSettings } from '../types';

interface SandboxRunOptionsProps {
  settings: SandboxExecutionSettings;
  onChange: (update: Partial<SandboxExecutionSettings>) => void;
}

export default function SandboxRunOptions({ settings, onChange }: SandboxRunOptionsProps) {
  const isLive = settings.runMode !== 'once';

  return (
    <section className="sandbox-options" aria-labelledby="sandbox-options-title">
      <div className="sandbox-options-heading">
        <div>
          <h3 id="sandbox-options-title">Execution mode</h3>
          <p>
            Choose whether the host runs once or streams frames through persistent Trace memory.
          </p>
        </div>
        {isLive && <span>Live output</span>}
      </div>

      <div className="sandbox-options-grid">
        <label className="sandbox-option sandbox-option-wide">
          <span>Run behavior</span>
          <select
            value={settings.runMode}
            onChange={(event) => onChange({ runMode: event.target.value as SandboxRunMode })}
          >
            <option value="once">Run once</option>
            <option value="persistent">Run whole script every tick</option>
            <option value="functions">Call setup(), then tick()</option>
          </select>
          <small>
            {settings.runMode === 'once' &&
              'Evaluate the script once and show its result and console.'}
            {settings.runMode === 'persistent' &&
              'Re-evaluate the full script each frame in the same memory.'}
            {settings.runMode === 'functions' &&
              'Register definitions once, pass arguments to setup(), then call tick() per frame.'}
          </small>
        </label>

        {settings.runMode === 'functions' && (
          <>
            <label className="sandbox-option">
              <span>Setup function</span>
              <input
                type="text"
                value={settings.setupFunction}
                onChange={(event) => onChange({ setupFunction: event.target.value })}
              />
            </label>
            <label className="sandbox-option">
              <span>Tick function</span>
              <input
                type="text"
                value={settings.tickFunction}
                onChange={(event) => onChange({ tickFunction: event.target.value })}
              />
            </label>
          </>
        )}

        {isLive && (
          <>
            <label className="sandbox-option">
              <span>Frames per second</span>
              <input
                type="number"
                min="1"
                max="60"
                step="1"
                value={settings.framesPerSecond}
                onChange={(event) => onChange({ framesPerSecond: Number(event.target.value) })}
              />
            </label>
            <label className="sandbox-option">
              <span>Chart minimum</span>
              <input
                type="number"
                value={settings.yMin}
                onChange={(event) => onChange({ yMin: Number(event.target.value) })}
              />
            </label>
            <label className="sandbox-option">
              <span>Chart maximum</span>
              <input
                type="number"
                value={settings.yMax}
                onChange={(event) => onChange({ yMax: Number(event.target.value) })}
              />
            </label>
          </>
        )}
      </div>

      {isLive && (
        <p className="sandbox-options-note">
          Named echoes such as <code>@=position@</code> automatically become labeled time-series
          lines.
        </p>
      )}
    </section>
  );
}
