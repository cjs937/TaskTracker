import type { User as UserType } from "../types";
import { Project } from "./Project";

interface DashboardProps {
    user: UserType;
    onLogout: (user: null) => void;
}

export function Dashboard({user, onLogout}:DashboardProps) {
    const Logout = () => {
        onLogout(null);
    };

    return (
        <>
            <div>
                <h2 className="pill">Dashboard</h2>
                <div className="flexRow">{
                    user.projects.map(currProject => (
                        <div className="pill" key={currProject.id}>
                            {currProject.name}
                        </div>
                    ))}
                    <div className="pill">+</div>
                    <div className="pill" onClick={Logout}>Logout</div>
                </div>
            </div>
        </>
    );
}