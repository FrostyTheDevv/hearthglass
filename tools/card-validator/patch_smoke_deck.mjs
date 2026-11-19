import fs from 'node:fs';

let code = fs.readFileSync('apps/game-client/scripts/tests/smoke_test_runner.gd', 'utf8');

const target = `\tvar current_deck: Dictionary = builder_instance.get("current_deck")
\tvar deck_cards: Array = current_deck.get("cards", [])
\tvar deck_title: String = current_deck.get("name", "Untitled Deck")
\tprint("  -> Active Deck: '%s' with %d cards" % [deck_title, deck_cards.size()])
\tif deck_cards.size() != 40:
\t\tprinterr("Expected legal 40-card deck, got: ", deck_cards.size())
\t\tbuilder_instance.queue_free()
\t\treturn false`;

const replacement = `\tvar filtered: Array = builder_instance.get("filtered_cards")
\tprint("  -> Deck Builder collection browser populated with %d cards (Target: 480)" % [filtered.size()])
\tif filtered.size() != 480:
\t\tprinterr("Expected 480 cards in collection browser, got: ", filtered.size())
\t\tbuilder_instance.queue_free()
\t\treturn false

\tvar active_deck: Dictionary = GameState.get_active_deck()
\tvar deck_cards: Array = active_deck.get("cards", [])
\tvar deck_title: String = active_deck.get("name", "Untitled Deck")
\tprint("  -> Active Player Deck: '%s' with %d card entries" % [deck_title, deck_cards.size()])

\tvar v_res: Dictionary = ConvergenceRules.validate_deck(active_deck)
\tprint("  -> Authoritative Rust validation for active deck: valid=%s, total=%d cards" % [
\t\tstr(v_res.get("valid", false)), int(v_res.get("total_cards", 0))
\t])
\tif not bool(v_res.get("valid", false)):
\t\tprinterr("Active deck failed Rust deck validation: ", v_res.get("errors", []))
\t\tbuilder_instance.queue_free()
\t\treturn false`;

if (!code.includes(target)) {
    console.error('Target not found in smoke_test_runner.gd');
    process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync('apps/game-client/scripts/tests/smoke_test_runner.gd', code, 'utf8');
console.log('Successfully updated smoke_test_runner.gd with proper deck builder validation');
