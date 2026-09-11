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

Five sections, which is as many as a tab bar can carry without becoming a menu.

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

The school was founded in 1876 and sits on Holland Park Avenue. The visual language
follows from that rather than from a software convention: warm paper rather than white,
navy ink, one school red drawn from the red and white check of the summer dress, fine
hairline rules, a serif for headings and a clean sans for the interface, and generous
space. Nothing is childish, because the reader is a parent, and nothing is corporate,
because the subject is a small prep school. The application mark is a boater.

I was unable to reach the school's own website from the build environment, so the
palette and typography are drawn from the school's known identity rather than sampled
from its site. Aligning the two is a short piece of work once the actual brand values
are to hand.

## What the prototype does not do

There is no authentication, no backend and no integration. Absence reporting, payments,
club sign-up, Late Stay booking, parents' evening booking and calendar subscription are
present as interface and explain themselves when tapped, but send nothing. Fixtures and
results are generated rather than real. The second child's name is illustrative and can
be changed under Family. Weather, which would usefully drive the kit advice on a games
day, is not wired to anything.

None of these are difficult. They are deliberately absent so that the prototype argues
for a shape rather than for a feature list.
