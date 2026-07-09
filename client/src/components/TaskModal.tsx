import { Modal } from "react-bootstrap";
import type { Task } from "../types";
import styles from "./modules/TaskModal.module.css"

interface TaskModalProps {
    taskItem: Task;
    show: boolean;
    onHide: () => void;
}

export function TaskModal({taskItem, show, onHide}:TaskModalProps) 
{
    return(
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton className={styles.modalHeader}>
                <Modal.Title className="pill">{taskItem.name}</Modal.Title>
                <div className={styles.pillRowGapped}>
                    <div className="pill">{taskItem.priority}</div>
                    <div className="pill">{taskItem.createdAt.toDateString()}</div>
                </div>
            </Modal.Header>
            <Modal.Body>
            <input className={styles.inputBox} type="text" defaultValue={taskItem.description}></input>
            </Modal.Body>
            <Modal.Footer>
                <div className={styles.pillRowGapped}>
                    <div className="pill">Tags</div>
                    <div className="pill">Delete</div>
                </div>
            </Modal.Footer>
        </Modal>
    );
}