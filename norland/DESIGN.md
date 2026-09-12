# Norland Place Parents: design note

## The problem

School information reaches parents in the wrong shape. It arrives as a stream of
emails, attachments, calendar invitations and WhatsApp corrections, organised by the
convenience of the sender rather than by the question the recipient is trying to
answer. The parent, at ten past seven in the morning, wants to know three things and
has to reconstruct each of them from three different documents: what is my child
wearing, what is on today, and who is collecting them and when. Where there are two
children in different year groups, the reconstruction has to be done twice, and the
information that governs it is distributed across a uniform list, a timetable, a
fixtures page, a club allocation email and a letter about photographs.

The design principle that follows is that the application should give answers rather
than sources. A uniform policy plus a timetable is not an answer. "Summer uniform, and
swimming kit because it is Wednesday" is an answer. Anywhere the app can do the
reasoning on the parent's behalf, it should.

## Information architecture

Five sections, which is as many as a tab bar can carry without becoming a menu, two task
screens reached from within them, and an alerts screen behind the bell.

**Today** is the landing screen and the one that justifies the application. It opens
with the date, the term and the week, and the number of school days to the next
holiday, which is the single most frequently asked question in any prep school family.
Beneath that, and only when there is something outstanding, sits a counted strip of
things the school needs from the parent, ordered by deadline rather than by arrival. A
card follows for each child: what they are wearing, what is on, what to bring, what is
for lunch, who collects them and when, and what prep is set. The screen closes with
tomorrow, in a single line per child, because the useful moment to learn that swimming
kit is needed is the evening before rather than the morning of.

**Diary** answers the same questions for any other day. It carries a day, week and
month view and a filter by child. The day view gives the full timetable. The week view
adds a kit summary, which is the form in which a parent actually packs a bag on a
Sunday evening. The month view gives the term at a glance, with the type of each event
distinguished by colour, and offers a calendar subscription so that the school's
calendar maintains itself inside the parent's own diary rather than being copied
across by hand and then going stale.

**Notices** is the correspondence file: letters, consents, payments, events and health
notices, filtered to the relevant year groups. Anything requiring a reply stays at the
top until it is dealt with and is repeated on Today, so that a consent form cannot be
lost simply by being scrolled past. Each notice carries its action in the notice itself
rather than in a link to a separate portal.

**School** is everything that does not change day to day and that a parent looks up
two or three times a term: the school day, term dates, uniform, menus, clubs, sport,
absence reporting, contacts, fees, wraparound care, health and medication, travel and
drop-off, the Parents' Association, policies and lost property. It is written as prose
and tables rather than as links to PDFs, because a PDF on a telephone at the school
gate is not information.

**Family** holds the record the school keeps: each child's form, house, allergies,
medical notes, the consents in force, and who is authorised to collect them. It also
holds the notification settings, including which adult in the family is told what,
which matters where a nanny or a second parent should receive collection and club
information but not academic reports.

## The derived answer

The single piece of logic worth describing is the one that produces the uniform line.
It takes the base state of the school, which follows a rule rather than a list: summer
uniform from the start of the Michaelmas term until October half term, winter uniform
until the May half term, summer uniform thereafter. It then adds the kit implied by
that child's timetable on that day, which is a property of the year group rather than
of the child. It then applies any event override, so that photographs produce blazers
and no games kit, a mufti day produces no uniform at all, and a concert in the evening
produces concert dress. Three inputs, one sentence out. The same function serves the
Today card, the week kit summary and the detail sheet behind any diary event, which is
why the answers cannot drift apart.

## The uniform check

The check is the derivation above, itemised. It takes the same three inputs and emits a
list in three groups, being what is worn, what is carried and what goes in the bag, with
an optional fourth for cold weather. A day that displaces the uniform, such as a mufti
day or World Book Day, replaces the worn list rather than adding to it, and suppresses
the cold-weather layer, because a uniform jumper is the wrong answer on a day with no
uniform. A day that displaces the timetable as well, such as Sports Day, drops the
timetable's kit entirely rather than asking a parent to pack swimming things for a day
at Barn Elms.

Two rules keep the list honest. Nothing appears twice, so where the year group's
standing list says "swimming kit" and the check itemises costume, cap, towel, goggles
and bag, the coarse label is suppressed. And the optional group does not count towards
the tally, so a parent is never told they are two items short because they have not
packed gloves in September.

Building it was worth it for what it exposed. Two faults in the sample calendar only
became visible once the answers were itemised: a trip scheduled on the day Year 4 swim,
so the list said "no bag" and then asked for a swim bag, and Sports Day falling on Year
2's Forest School afternoon. Both are exactly the sort of thing a school's own calendar
does, and a parent app that merely republishes the calendar passes the contradiction
straight through to the parent. One that derives an answer has to resolve it.

## The kit list

The daily check answers "what does today need". The kit list answers the other uniform
question, which is asked twice a year and costs a great deal more: what does the school
require in total, what is already in the cupboard, and what has to be bought. It is the
same pattern applied to a different horizon, and the two share their vocabulary so that
an item ticked as owned reads the same as an item ticked as packed.

Three things make it useful rather than merely a list. Quantities are per year group, so
a Year 2 boy is asked for grey shorts, a book bag and no gum shield, while a Year 4 boy
is asked for trousers, boots, a gum shield and a rucksack. Each item says where it comes
from, since roughly a third of a school list carries a crest and must come from the
outfitter while the rest is ordinary and can come from anywhere, and that distinction is
the one a parent cannot work out from a list of garments. And the items worth buying
second-hand are marked, because a blazer, a boater, a cap and a tracksuit are grown out
of long before they wear out, and the Parents' Association sells them at the start of
each term.

The prices are indicative and are stated as such in the app. They exist to give a sense
of the total, which is the number a parent actually wants in September, not to quote one.
The outfitter holds the school's own list and its prices, and the app links to it.

## Alerts and reminders

Two different things share one screen, deliberately. What the school sends you and what
you have asked to be reminded of both interrupt you, so the place to see and govern them
is the same place, behind the bell.

The prototype is candid about its limits rather than pretending. A page with no server
cannot receive a push, and the web has no dependable way to schedule a local notification
for a day when the page is shut: Notification Triggers never shipped broadly, and the
Notifications API only fires while something of yours is running. So reminders here are
real and are stored, they fire while the app is open, and the card that offers them says
in plain words that a production build would use Web Push and that on an iPhone that
works only once the app has been added to the Home Screen. A prototype that faked a lock
screen alert would be lying about the one thing a parent would test first.

The system notification is best effort and the in-app banner is what actually carries the
alert, because an embedded page may have notifications refused outright by the frame it
sits in. That ordering means the feature degrades to something that still works rather
than to nothing.

Reminders can be made from nothing, but they are more useful made from something, so they
can be raised from a notice, where the default is the evening before the deadline, from a
diary entry, where the default is the day before, and from the kit list, where the title
counts what is still to buy. A repeating reminder advances rather than completes, so
"every school day" means the next school day rather than tomorrow, which in a school
calendar is not the same thing.

## Content model

The prototype is deliberately built on a small number of entities, because these are
the entities a real integration would have to map on to.

A **child** carries a year group, a form, a house, a form teacher, medical and allergy
records, a set of consents, a default collection arrangement and a list of authorised
adults. A **year group** carries a weekly pattern of lessons, each day of which carries
the kit implied and anything to bring. A **term** carries its start, its end and its
half term, and generates its weeks. An **event** carries a term, a week, a weekday, a
type, an audience which is either the whole school or named year groups or one child,
and optionally a time, a place and a note. A **notice** carries a sender, a category, an
audience and, where relevant, an action with a deadline. **Clubs**, **fixtures** and
**menus** are all patterns expressed against the week rather than lists of dates, which
is why the prototype can populate any month of the year without a data file.

## What a real build would involve

The application should hold almost no data of its own. Everything above already exists
in the school's management system, which in a school of this size is likely to be
iSAMS, Engage or Arbor, and in its teaching and learning platform. The work is
integration and presentation rather than data entry, and the test of the project is
whether the school office has to type anything twice. If it does, the project has
failed, because a second system that the office maintains by hand will fall out of date
within a term and the parents will go back to email.

A prior question is what happens to the existing parent portal, which the school
already runs and links from the top of every page of its site. An application that sits
alongside it gives parents two places to look and is worse than either; the honest
options are that the app becomes the front end to the same data and the portal is
retired for parents, or the app is not built. That is a decision for the school rather
than a technical constraint, but it should be taken before anything is commissioned.

The practical sequence is to read the calendar, the timetable, the year group and form
allocations and the pupil record from the management system by API; to publish notices
from wherever the school already writes them rather than in a new editor; and to write
back only three things, being absence reports, consents and collection changes, each of
which currently costs the office a telephone call.

Notifications deserve more care than they usually receive. The prototype's default is
one evening message at seven o'clock carrying tomorrow's kit and anything to bring,
with immediate messages reserved for notices and for changes to something the parent
has already been told, and with nothing at all between eight at night and seven in the
morning unless it is urgent. A parent application that sends a push notification for
every event loses its audience inside a fortnight, at which point the school has a
communication channel it believes is working and which nobody reads.

## Data protection

The application processes children's personal data, including allergy and medical
information, which is special category data. That places it squarely within the
school's own obligations rather than at the edge of them. A real deployment needs a
data protection impact assessment before any code is deployed, a privacy notice for
parents that names the application, a data processing agreement with whoever hosts it,
role-based access so that a third party carer sees collection and club information and
nothing else, retention that matches the school's existing policy, and a considered
answer on where photographs are stored and who may export them. The prototype avoids
all of this by holding nothing: it generates its content and keeps read state in the
browser.

## Design language

The identity is the school's rather than an invention. A navy shield carrying an
interlocking monogram, a wide letterspaced geometric sans for the wordmark, a slate
blue utility strip above the crest, and a cool navy and white palette throughout. The
app follows all four. The strip, which on the school's own site carries the parent
portal and the dates page, here states the term, the week and the number of school days
to the next holiday, so that the answer to the most frequently asked question in the
school is present on every screen without being asked for.

The crest is the school's own artwork rather than a drawing of it. The logo file never
reached the build environment, so it was recovered from a screenshot of the site: the
crest located by scanning for its ink, cropped, and the white keyed to transparency by
alpha rather than by threshold, so the edges stay clean. It is therefore at screenshot
resolution, which is ample for the header and adequate for the home-screen icon, and it
should be replaced with the original artwork before this went anywhere real.

Two deliberate departures. Poppins stands in for the wordmark face, which I have
matched by eye rather than identified; substituting the school's licensed face is a
one-line change. And red, which does not appear in the school's palette at all, is
reserved here as a semantic colour for anything overdue, never as decoration, which is
why the children's own colours are drawn from the navy and green range instead.

The wider restraint is that nothing is childish, because the reader is a parent, and
nothing is corporate, because the subject is a prep school of some three hundred
children in its hundred and fiftieth year.

## What the prototype does not do

There is no authentication, no backend and no integration. Absence reporting, payments,
club sign-up, Late Stay booking, parents' evening booking and calendar subscription are
present as interface and explain themselves when tapped, but send nothing. Fixtures and
results are generated rather than real. The second child's name is illustrative and can
be changed under Family. Weather, which would usefully drive the kit advice on a games
day, is not wired to anything.

None of these are difficult. They are deliberately absent so that the prototype argues
for a shape rather than for a feature list.
