
import { observer } from "mobx-react-lite";
import { authStore } from "./authStore";
import Login from "./Login";
import Dashboard from "./Dashboard";

const App = observer(() => {
  return (
    <>
      {authStore.isAuthenticated ? (
        <Dashboard /> 
      ) : (
        <Login />
      )}
    </>
  );
});

export default App;