import { useT } from '../hooks/useT'

const STATS = [
  { count: 320, suffix: '+', key: 'ts1' },
  { count: 10, suffix: '+', key: 'ts2' },
  { count: 4.9, decimals: 1, key: 'ts3' },
  { count: 5, suffix: '', key: 'ts4' },
  { count: 100, suffix: '%', key: 'ts5' },
]

export default function TrustStrip() {
  const { t } = useT()

  return (
    <div className="trust-strip" id="trustStrip">
      {STATS.map((stat, i) => (
        <div key={stat.key} style={{ display: 'contents' }}>
          {i > 0 && <div className="sep" />}
          <div className="ts-item">
            <div>
              <div className="ts-num">
                {stat.decimals ? stat.count.toFixed(stat.decimals) : `${stat.count}${stat.suffix}`}
              </div>
              <div className="ts-lbl">{t(stat.key)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
