import type { User as UserType } from "../types";
import { Project } from "./Project";
import { useNavigate } from 'react-router-dom'

interface DashboardProps {
    userToken: string;
    user: UserType;
    onLogout: (token: null, user: null) => void;
}

export function Dashboard({user, onLogout}:DashboardProps) {
    const navigate = useNavigate();

    const Logout = () => {
        onLogout(null, null);
    };

    const onProjClicked = (projectID: number) => {
        navigate(`/projects/${projectID}`);
    };

    return (
        <>
            <div>
                <h2 className="pill">Dashboard</h2>
                <div className="flexRow">{
                    user.projects.map(currProject => (
                        <div className="pill" key={currProject.id} onClick={() => onProjClicked(currProject.id)}>
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