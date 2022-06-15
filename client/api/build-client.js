import axios from "axios";

export default ({ req }) => {
  // no window: server-side
  if (typeof window === "undefined") {
    const serviceName = "ingress-nginx-controller";
    const nameSpace = "ingress-nginx";

    return axios.create({
      baseURL: `http://${serviceName}.${nameSpace}.svc.cluster.local`,
      headers: req.headers,
    });

    // window: browser-side
  } else {
    return axios.create({
      baseURL: "/",
    });
  }
};
