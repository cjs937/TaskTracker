import { Modal } from "react-bootstrap";
import type { Task  as TaskType } from "../types";
import styles from "./TaskModal.module.css"

interface TaskModalProps {
    taskItem: TaskType;
    show: boolean;
    onHide: () => void;
}

export function TaskModal({taskItem, show, onHide}:TaskModalProps) 
{
    console.log("Opened Modal: " + taskItem.title);
    return(
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>TestHeader</Modal.Title>
            </Modal.Header>
            <Modal.Body>TestBody</Modal.Body>
            <Modal.Footer>TestFooter</Modal.Footer>
        </Modal>
    );
}