import Header from "./Header";
import Calendar from "./Calendar";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Header />
      <main>
        <Calendar />
      </main>
    </div>
  );
};

export default Dashboard;
