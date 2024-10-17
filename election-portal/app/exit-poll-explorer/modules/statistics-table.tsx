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
          {data.map((category: any, idx: number) => (
            <tr key={idx} className="stats-row">
              <th>{category.category}</th>
              <td>{category.percentVote}</td>
              <td>{category.percentBiden}</td>
              <td>{category.percentTrump}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default StatsTable;
