import { useRoutes } from "react-router-dom";
import routes from "./routes";

import "antd/dist/reset.css";
// ("@import 'antd/dist/antd.css'");
const App = () => {
  const element = useRoutes(routes);

  return <>{element}</>;
};

export default App;
