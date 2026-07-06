import { Modal } from "react-bootstrap";
import type { Task } from "../types";
import styles from "./TaskModal.module.css"

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
                <Modal.Title className={styles.pill}>{taskItem.title}</Modal.Title>
                <div className={styles.pillRowGapped}>
                    <div className={styles.pill}>{taskItem.priority}</div>
                    <div className={styles.pill}>{taskItem.createdAt.toDateString()}</div>
                </div>
            </Modal.Header>
            <Modal.Body>
            <input className={styles.inputBox} type="text" defaultValue={taskItem.description}></input>
            </Modal.Body>
            <Modal.Footer>
                <div className={styles.pillRowGapped}>
                    <div className={styles.pill}>Tags</div>
                    <div className={styles.pill}>Delete</div>
                </div>
            </Modal.Footer>
        </Modal>
    );
}