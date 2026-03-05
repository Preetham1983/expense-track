"""Observer pattern base classes for the notification system.

Implements the Observer design pattern to decouple event producers
(expense creation, EMI due dates) from notification delivery.
"""

from abc import ABC, abstractmethod
from typing import Any


class Observer(ABC):
    """Abstract observer that reacts to domain events.

    Each concrete observer defines how it handles a specific event
    type (e.g., EMI reminder, spending alert).
    """

    @abstractmethod
    async def update(self, event_type: str, data: dict[str, Any]) -> None:
        """Handle an incoming event.

        Args:
            event_type: The type of event that occurred.
            data: Event payload with contextual information.
        """
        pass


class NotificationSubject:
    """Subject (publisher) that maintains a list of observers.

    Services attach observers at startup. When a domain event
    occurs, ``notify`` dispatches to all registered observers.
    """

    def __init__(self) -> None:
        self._observers: list[Observer] = []

    def attach(self, observer: Observer) -> None:
        """Register an observer.

        Args:
            observer: The observer instance to add.
        """
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        """Remove a registered observer.

        Args:
            observer: The observer instance to remove.
        """
        self._observers = [o for o in self._observers if o is not observer]

    async def notify(self, event_type: str, data: dict[str, Any]) -> None:
        """Dispatch an event to all registered observers.

        Args:
            event_type: The type of event.
            data: Event payload.
        """
        for observer in self._observers:
            await observer.update(event_type, data)
