/**
 * A message extracted from a template.
 *
 * The identity of a message is comprised of `content` and `meaning`.
 *
 * `description` is additional information provided to the translator.
 */
export declare class Message {
    content: string;
    meaning: string;
    description: string;
    constructor(content: string, meaning: string, description?: string);
}
/**
 * Computes the id of a message
 */
export declare function id(m: Message): string;
