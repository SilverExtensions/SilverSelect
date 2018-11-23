'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let selectLines = vscode.commands.registerCommand('extension.selectLines', () => {
        const cancellationToken = new vscode.CancellationTokenSource().token,
            editor = vscode.window.activeTextEditor,
            currentSelection = editor && editor.selection,
            currentLine = currentSelection && currentSelection.active.line;
        const inputBox = vscode.window.showInputBox({
                placeHolder: 'Input line number number or range e.g. `3` or 5,10`'
            },
            cancellationToken
        );

        inputBox.then((inputText?: string) => {
            if (!inputText) { return; }

            const input = inputText.trim(),
                tokenizedInput = input.split(''),
                invalidCharacterFound = tokenizedInput
                    .find((char: String) => char.match('[0-9,]') === null),
                invalidCommaPosition = input.startsWith(',') || input.endsWith(','),
                moreThanOneCommandFound = (tokenizedInput.filter((char) => char === ',').length > 1),
                isInputInvalid = (invalidCharacterFound || invalidCommaPosition || moreThanOneCommandFound);
            if (isInputInvalid) { return; }

            const [firstLine, secondLine] = inputText.split(','),
                firstLineNumber = firstLine && parseInt(firstLine.trim()) - 1,
                secondLineNumber = secondLine && parseInt(secondLine.trim()) - 1,
                currentLineNumber = currentLine && currentLine.valueOf();

            if (!secondLineNumber && currentLineNumber !== null && firstLineNumber !== null && editor) {
                selectBetweenLines(
                    Number(currentLineNumber),
                    Number(firstLineNumber),
                    editor
                );
            }
            if (typeof(secondLineNumber) !== 'undefined' && firstLineNumber !== null && editor) {
                selectBetweenLines(
                    Number(firstLineNumber),
                    Number(secondLineNumber),
                    editor
                );
            }
        },
        (error) => {
            vscode.window.showErrorMessage(error);
        });

        function selectBetweenLines(firstLineNumber: number, secondLineNumber: number, editor: vscode.TextEditor) {
            const document = editor && editor.document && editor.document,
                startNumber = roundToRealLineNumber(firstLineNumber, editor),
                endNumber = roundToRealLineNumber(secondLineNumber, editor),
                firstLineRange = document && document.lineAt(startNumber).range,
                secondLineRange = document && document.lineAt(endNumber).range;


            let anchor: vscode.Position,
                active: vscode.Position;

            if (startNumber > endNumber) {
                anchor = firstLineRange.end;
                active = new vscode.Position(endNumber, 0);
                setSelection(editor, anchor, active);
            }

            if (startNumber <= endNumber) {
                anchor = new vscode.Position(startNumber, 0);
                active = secondLineRange.end;
                setSelection(editor, anchor, active);
            }
        }

        function setSelection(editor: vscode.TextEditor, anchor: vscode.Position, active: vscode.Position) {
            (editor && editor).selection = new vscode.Selection(
                anchor,
                active
            );
        }

        function roundToRealLineNumber(number: number, editor: vscode.TextEditor): number {
            const document = editor && editor.document && editor.document,
                firstRealLine = 0,
                lastRealLine = document.lineCount - 1;
            let roundedLineNumber = Number(number);

            if (Number(number) < firstRealLine) { roundedLineNumber = firstRealLine; }
            if (Number(number) > lastRealLine) { roundedLineNumber = lastRealLine; }


            return roundedLineNumber;
        }
    });

    let flipCursorLocation = vscode.commands.registerCommand('extension.flipCursorLocation', () => {
        const editor = vscode && vscode.window && vscode.window.activeTextEditor;

        if (editor && editor.selection) {
            editor.selection = new vscode.Selection(
                editor.selection.active,
                editor.selection.anchor
            );
        }
    });

    context.subscriptions.push(selectLines);
    context.subscriptions.push(flipCursorLocation);
}

export function deactivate() { }