import fs from 'node:fs';

let code = fs.readFileSync('apps/game-client/scripts/ui/card_frame_widget.gd', 'utf8');
code = code.replace('var tex_rect := TextureRect.new()', 'var tex_rect := TextureRect.new()\n\t\t\t\ttex_rect.name = "ArtTextureRect"');
fs.writeFileSync('apps/game-client/scripts/ui/card_frame_widget.gd', code, 'utf8');

let testCode = fs.readFileSync('apps/game-client/scripts/tests/smoke_test_runner.gd', 'utf8');
testCode = testCode.replace(
    'var art_rect = widget.get_node_or_null("Margin/VBox/ArtRect")\n\t\tvar has_texture := false\n\t\tif art_rect and art_rect.texture != null:\n\t\t\thas_texture = true',
    'var art_rect = widget.find_child("ArtTextureRect", true, false)\n\t\tvar has_texture: bool = (art_rect != null and art_rect.texture != null)'
);
fs.writeFileSync('apps/game-client/scripts/tests/smoke_test_runner.gd', testCode, 'utf8');
console.log('Successfully patched art rect detection in card_frame_widget.gd and smoke_test_runner.gd');
