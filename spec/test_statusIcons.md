{>> TODO: text before any heading should not crash the code <<}

# Heading (done)

makrdown supports comments starting with:
- { > >
- < ! - -

When using pandoc, the second type gets removed, so I'm using the firts one if I want to see comments in the output document.

For improved perception I advise to have the firts type highlighted and the second geryed out.

This branch only considers
- the first type for todo's (because they need to be visible in the output)
- Any occurrence of 'DONE:' in or outside comments (you can add a comment of type 2 and have your completion note stripped from pandoc)

## Sub heading with icon
{>> TODO: see if this works <<}

## Sub heading without icon

This is intentional for testing

## Status types

We have four types

### DONE

mark it with any of the following:

#### in text

DONE:

#### in visible comments

{>> TODO: DONE: Some comment that wants to be retained <<}
The line above could be highlighte instead of greyed, hacking the style.

#### in hidden comments

The following line stripped when using pandoc:
<!-- DONE: all 'done' cases covered -->

### TODO

#### matched
{>> TODO: this will be marked in the outline  <<}

#### non matched

<!-- TODO: this will not be hightligted, just for yourself -->

### NEXT

You can use this to bookmark the most urgent tasks

{>> TODO: NEXT: just know where to start next <<}

### LAST

Similarly some tasks are low priority

{>> TODO: LAST:  <<}

# Roadmap

This is some text, in a top heading with no icon.

## Initial notes

{>> TODO: DONE: write a test document with some explanation <<}

## Configuration
The code at the moment is quite brutal. Development ideas:

- enabled/disabled setting for the whole function {>> TODO: <<}
- keywords could be made configurable {>> TODO: <<}

## Folded statuses

We could show the icon at higher levels of the tree, when the lower levels are collapsed.
This could be done through the stylesheet.

## Other formats
Only the markdown type is supported

- extend to other formats? {>> TODO: LAST: <<}
