import './statistics-table.css';

interface StatsTableProps {
  data: any;
  names: string[];
}

const StatsTable: React.FC<StatsTableProps> = ({ data, names }) => {
  return (
    <div className="table-wrapper">
      <table className="stats-table">
        <thead className="header">
          <tr>
            <th></th>
            <th>% Vote</th>
            <th>% {names[0]}</th>
            <th>% {names[1]}</th>
          </tr>
        </thead>
        <tbody className="table-contents">
          {data.map((question: any, idx: number) => (
            <tr key={idx} className="stats-row">
              <th>{question.answer}</th>
              <td>{question.percentVote}</td>
              <td>{question.percentFirst}</td>
              <td>{question.percentSecond}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default StatsTable;
