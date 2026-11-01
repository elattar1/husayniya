import { queryOptions } from "@tanstack/react-query";
import { getDriverBoard, getDrivers } from "./delivery.functions";

export const driverBoardQuery = queryOptions({ queryKey: ["delivery-board"], queryFn: () => getDriverBoard(), staleTime: 10_000 });
export const driversQuery = queryOptions({ queryKey: ["delivery-fleet"], queryFn: () => getDrivers(), staleTime: 10_000 });