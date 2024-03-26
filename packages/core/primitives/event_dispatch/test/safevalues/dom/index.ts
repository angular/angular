import {loadDominoOrNull} from '@angular/private/testing';

export const safeElement = {
    async setInnerHtml(element: Element, content: string) {
        // const domino = await loadDominoOrNull();
        // const window = domino.createWindow(content, '/')!;
        // element.appendChild(window.document.body);
        element.innerHTML = content;
    }
};