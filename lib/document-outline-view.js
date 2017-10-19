'use babel';

import {Point} from 'atom';
import {DocumentTree} from './tree-view';
import {createElement} from './util';

export default class DocumentOutlineView {

  constructor() {
    this.highlightSubscription = null;
    this.cursorPositionSubscription = null;
    this.element = createElement('div', {class: 'document-outline'});

    this.docTree = new DocumentTree();
    this.element.appendChild(this.docTree);
  }

  getDefaultLocation() {
    return atom.config.get('document-outline.defaultSide');
  }

  getTitle() {
    return 'Outline';
  }

  getURI() {
    return 'atom://document-outline/outline';
  }

  getAllowedLocations() {
    return ['left', 'right'];
  }

  getPreferredWidth() {
    return 200;
  }

  clear() {
    while (this.docTree.firstChild) {
      this.docTree.removeChild(this.docTree.firstChild);
    }
  }

  // Tear down any state and detach
  destroy() {
    if (this.highlightSubscription) {
      this.highlightSubscription.dispose();
    }
    if (this.cursorPositionSubscription) {
      this.cursorPositionSubscription.dispose();
    }
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
  
  // @CBbenghi
  // this function is taken from history.js in the cursor-history package.
  // depends on cursor-history being installed because of the class style used.
  //
  flash(editor, highlightPoint) {
    if (this.flashMarker) this.flashMarker.destroy()
	// markBufferPosition needs a point
    this.flashMarker = editor.markBufferPosition(highlightPoint)
    editor.decorateMarker(this.flashMarker, {type: "line", class: "cursor-history-flash-line"})

    let disposable

    const destroyMarker = () => {
      if (disposable) {
        disposable.dispose()
        disposable = null
      }
      if (this.flashMarker) {
        this.flashMarker.destroy()
        this.flashMarker = null
      }
    }

    disposable = editor.onDidChangeCursorPosition(destroyMarker)
    // [NOTE] animation-duration has to be shorter than this value(1sec)
    setTimeout(destroyMarker, 1000)
  }

  setModel(headings, editor) {
    // Set the headings, which should rebuild the DOM tree
    this.docTree.setModel(headings);

    // Set up interactive behaviours that need the current editor
    for (let label of this.docTree.querySelectorAll('span.tree-item-text')) {
      label.addEventListener('click', event => {
        let treeNode = event.target.parentNode;
        const pt = new Point(treeNode.range.start.row - 1, 0);
        editor.scrollToBufferPosition(pt, {center: true});
		
		// TODO: @CBbenghi, the call to flash() should be made optional via config
		this.flash(editor, pt);
		
        event.stopPropagation();
      });
    }

    // Clear existing events and re-subscribe to make sure we don't accumulate subscriptions
    if (this.highlightSubscription) {
      this.highlightSubscription.dispose();
    }
    if (this.cursorPositionSubscription) {
      this.cursorPositionSubscription.dispose();
    }

    // NOTE: highlightSection is wierdly resource intensive.
    if (atom.config.get("document-outline.highlightCurrentSection")) {
      this.highlightSectionAtCursor(editor.getCursorBufferPosition());
      this.highlightSubscription = (editor.onDidChangeCursorPosition(event => {
        // Highligh section in outline only if buffer position change
        if (event.oldBufferPosition.row !== event.newBufferPosition.row) {
          this.highlightSectionAtCursor(event.cursor.getBufferPosition());
        }
      }));
    }

    if (atom.config.get("document-outline.autoScrollOutline")) {
      this.scrollToSectionAtCursor(editor.getCursorBufferPosition());
      this.cursorPositionSubscription = (editor.onDidChangeCursorPosition(event => {
        if (event.oldBufferPosition.row !== event.newBufferPosition.row) {
          this.scrollToSectionAtCursor(event.cursor.getBufferPosition());
        }
      }));
    }
  }

  highlightSectionAtCursor(cursorPos) {
    // TODO this gets deoptimised for 'TryCatch', no idea why.
    // TODO one day could prefer using the iterator, right now seems much slower
    // let doScroll = atom.config.get("document-outline.autoScrollOutline");
    let allItems = this.docTree.getDepthFirstItems();
    let matchId;
    let matchPos = 0;
    let range;
    let item;
    for (item of allItems) {
      item.childNodes[1].classList.remove('currentTree');
      range = item.range;
      if (range) {
        let cp = cursorPos.row +1;
        if (range.start.row <= cp && range.end.row >= cp) {
          item.classList.add('highlight');
          if (range.start.row > matchPos)
          {
            matchId = item.childNodes[1].classList;
            matchPos = range.start.row;
          }
        } else {
          item.classList.remove('highlight');
        }
      } else {
        item.classList.remove('highlight');
      }
    }
    if (matchId) {
        matchId.add('currentTree');
    }
  }

  scrollToSectionAtCursor(cursorPos) {
    let range;
    let item;
    let allItems = this.docTree.getDepthFirstItems();
    // if (doScroll) {
    for (item of allItems) {
      range = item.range;
      if (range) {
        if (range.containsPoint(cursorPos)) {
          this.element.scrollTop = item.offsetTop - 20;
          break;
        }
      }
    }
  }
}
//
// function offset(el) {
//   let rect = el.getBoundingClientRect();
//   let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
//   let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//   return {top: rect.top + scrollTop, left: rect.left + scrollLeft};
// }
