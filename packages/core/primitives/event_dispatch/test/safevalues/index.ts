export const safeElement = {
    setInnerHTML(element: Element, content: string) {
        element.innerHTML = content;
    }
};