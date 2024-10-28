import "./statistics-table.css";

interface StatsTableProps {
  data: any;
}

const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
  return (
    <div className="table-wrapper">
      <table className="stats-table">
        <thead className="header">
          <tr>
            <th></th>
            <th>% Vote</th>
            <th>% Biden</th>
            <th>% Trump</th>
          </tr>
        </thead>
        <tbody className="table-contents">
          {data.map((question: any, idx: number) => (
            <tr key={idx} className="stats-row">
              <th>{question.answer}</th>
              <td>{question.percentVote}</td>
              <td>{question.percentBiden}</td>
              <td>{question.percentTrump}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default StatsTable;
