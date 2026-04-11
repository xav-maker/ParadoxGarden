import type { ActionLogEntry } from '@jardins/shared';

interface ActionLogProps {
  actionLog: ActionLogEntry[];
}

export function ActionLog({ actionLog }: ActionLogProps) {
  const recentEntries = actionLog.slice(-10).reverse();

  return (
    <div className="action-log">
      <h3>Journal</h3>
      {recentEntries.length === 0 && <p className="log-empty">Aucune action pour le moment</p>}
      {recentEntries.map((entry, i) => (
        <div key={i} className="log-entry">
          <div className="log-turn">Tour {Math.ceil(entry.turnNumber / 2)}</div>
          {entry.growthEvents.map((e, j) => (
            <div key={`g-${j}`} className="log-event growth">{e}</div>
          ))}
          {entry.effectEvents.map((e, j) => (
            <div key={`e-${j}`} className="log-event effect">{e}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
